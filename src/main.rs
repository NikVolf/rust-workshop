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