extern crate tiny_keccak;

use tiny_keccak::Keccak;

fn main() {
    println!("Welcome to the Parity WebAssembly Workshop!");
}

fn keccak<T>(input: T) -> [u8; 32] where T: AsRef<[u8]> {
    let mut keccak = Keccak::new_keccak256();
    let mut res = [0u8; 32];
    keccak.update(input.as_ref());
    keccak.finalize(&mut res);
    res
}

fn round(input: &mut [u8; 32]) {
    let mut keccak = Keccak::new_keccak256();
    keccak.update(input.as_ref());
    keccak.finalize(input);
}

#[no_mangle]
pub fn brain_wallet_derive(source_ptr: *const u8, source_len: u32, dest_ptr: *mut u8) {
    let source: Vec<u8> = unsafe {
        Vec::from_raw_parts(source_ptr as *mut u8, source_len as usize, source_len as usize)
    };

    let mut dest: Vec<u8> = unsafe {
        Vec::from_raw_parts(dest_ptr, 32, 32)
    };

    let mut result = keccak(&source);

    for _ in 0..10000 {
        round(&mut result);
    }

    dest[..].copy_from_slice(&result);

    std::mem::forget(source);
    std::mem::forget(dest);
}

#[test]
fn derive_test() {
    let source = "deuce clown universe brain thousand unique";
    let mut result = [0u8; 32];

    brain_wallet_derive(source.as_ptr(), source.len() as u32, result.as_mut_ptr());

    assert_eq!(
        result,
        [
            0x14, 0x76, 0x78, 0x2f, 0x2d, 0x9d, 0xd7, 0x99,
            0xf0, 0xbb, 0xdf, 0x2e, 0xd5, 0x33, 0xfb, 0x01,
            0x79, 0x90, 0x28, 0x34, 0xd7, 0xd0, 0x1f, 0x2c,
            0x54, 0xff, 0x92, 0x32, 0xd2, 0xcf, 0xa4, 0x29
        ]
    );
}