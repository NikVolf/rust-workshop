extern crate tiny_keccak;
extern crate bigint;

#[cfg(test)]
mod tests;

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

/// This function takes string of length `source_len` at memory indicated
/// by the raw pointer `source_ptr`, runs 10001 rounds of keccak-256 on it
/// and writes the result (of length 32) to memory indicated by the
/// raw pointer `dest_ptr`
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

/// This function takes the 256-bit (32 bytes) integer from the memory
/// at the location specified by `source_ptr`, makes modular exponentation
/// to the power of 1000000 mod 10000000000000000000000000331 and writes result
/// to memory at `dest_ptr`.
/// input and result are both in little-endian
#[no_mangle]
pub fn modexp(source_ptr: *const u8, dest_ptr: *mut u8) {
    use bigint::U256;

    let source: Vec<u8> = unsafe {
        Vec::from_raw_parts(source_ptr as *mut u8, 32, 32)
    };

    let mut dest: Vec<u8> = unsafe {
        Vec::from_raw_parts(dest_ptr as *mut u8, 32, 32)
    };

    let p = U256::from_dec_str("190336703473395182854426616575356495301")
        .expect("190336703473395182854426616575356495301 to be a valid U256");
    let mut result = U256::from_little_endian(&source);

    for _ in 0..1000000 {
        result = (result * result) % p;
    }

    result.to_little_endian(&mut dest[..]);

    std::mem::forget(source);
    std::mem::forget(dest);
}