const qs = require('querystring');

// 🔴 BẠN XÓA XONG ĐIỀN THÔNG TIN THẬT VÀO 3 BIẾN BÊN DƯỚI: 🔴
const APP_ID = '3874737669226678936';
const APP_SECRET = '5IzR3EhAjYZrMhJ605q6';
const AUTH_CODE = 'S79ws_t8No8lMLxIwFv1LaOxLEZneqaW3JqZquwjE38o80pzthGF3ITb8ucVa0WqB0mJyTQe33TMBopgxAOR8Wmq7DFCXJHVGaK8qShS5XSlJ7_oaCf6AYqBOz_avZjiVXjmWD_YGZrxOZgatgyA62O_KwMBicPnRobnc8odO24vImIQYSeBAp8JE8Nknaqd2WvdwEsPVX8eA77Kxh1w52OqTOY4zazZI2CxuQgs7bWMP4RyWDfGKMys3lo-ct9j4rDVprZHIcEn2g-OVggPSGqxZhnI_wO4ucwnmX_prqc5G_I07VxnVkbTXhjQBgB4HIhNQS-2-AYCQ5LZ1zX2gzia479Ae7MUxMyBDJQ9Nf3z224nTlPTlzaKRm9UMIO1HqDD_ynjCW';

async function getToken() {
    try {
        const response = await fetch('https://oauth.zaloapp.com/v4/oa/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'secret_key': APP_SECRET
            },
            body: qs.stringify({
                app_id: APP_ID,
                grant_type: 'authorization_code',
                code: AUTH_CODE
            })
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            throw new Error(JSON.stringify(data));
        }

        console.log('\n🎉 LẤY TOKEN THÀNH CÔNG 🎉');
        console.log('--------------------------------------------------');
        console.log('👉 ACCESS TOKEN:\n', data.access_token);
        console.log('\n👉 REFRESH TOKEN:\n', data.refresh_token);
        console.log('--------------------------------------------------');

        // Copy 2 mã này lưu ra Notepad nha!

    } catch (error) {
        console.error('❌ LỖI RỒI BẠN ƠI:', error.response ? error.response.data : error.message);
    }
}

getToken();
