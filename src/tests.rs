use {brain_wallet_derive, modexp};

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

#[test]
fn modexp_1() {
    use bigint::U256;

    let source = U256::from_dec_str(
        "190336703473395182854426616575356495301"
    ).unwrap();

    let mut source_param = [0u8; 32];
    let mut dest_param = [0u8; 32];

    source.to_little_endian(&mut source_param);

    modexp(source_param.as_ptr(), dest_param.as_mut_ptr());

    let result = U256::from_little_endian(&dest_param);

    assert_eq!(result, U256::zero());
}


#[test]
fn modexp_2() {
    use bigint::U256;

    let source = U256::from_dec_str(
        "1000000000"
    ).unwrap();

    let mut source_param = [0u8; 32];
    let mut dest_param = [0u8; 32];

    source.to_little_endian(&mut source_param);

    modexp(source_param.as_ptr(), dest_param.as_mut_ptr());

    let result = U256::from_little_endian(&dest_param);

    assert_eq!(result, U256::from_dec_str("129511937775246815794430130115251170553").unwrap());
}