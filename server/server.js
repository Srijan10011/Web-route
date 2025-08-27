const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

const esewaConfig = {
  merchantId: 'EPAYTEST',
  merchantSecret: '8gBm/:&EnhH.1/q',
  baseUrl: 'https://rc-epay.esewa.com.np',
};

app.post('/initiate-payment', async (req, res) => {
  const { amount, productId, successUrl, failureUrl } = req.body;

  const transactionUuid = crypto.randomUUID();
  const signature = crypto
    .createHmac('sha256', esewaConfig.merchantSecret)
    .update(`total_amount=${amount},transaction_uuid=${transactionUuid},product_code=${productId}`)
    .digest('base64');

  const formData = {
    amount: amount,
    failure_url: failureUrl,
    product_delivery_charge: '0',
    product_service_charge: '0',
    product_code: productId,
    signature: signature,
    signed_field_names: 'total_amount,transaction_uuid,product_code',
    success_url: successUrl,
    tax_amount: '0',
    total_amount: amount,
    transaction_uuid: transactionUuid,
  };

  try {
    const response = await axios.post(`${esewaConfig.baseUrl}/api/epay/main/v2/form`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    res.json({ payment_url: response.request.res.responseUrl });
  } catch (error) {
    console.error('Error initiating payment:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

app.get('/verify-payment', async (req, res) => {
  const data = req.query.data;

  if (!data) {
    return res.redirect('http://localhost:5173/failure?message=No payment data received.');
  }

  const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));

  const signature = crypto
    .createHmac('sha256', esewaConfig.merchantSecret)
    .update(`transaction_code=${decodedData.transaction_code},status=${decodedData.status},total_amount=${decodedData.total_amount},transaction_uuid=${decodedData.transaction_uuid},product_code=${decodedData.product_code},signed_field_names=transaction_code,status,total_amount,transaction_uuid,product_code`)
    .digest('base64');

  if (signature === decodedData.signature) {
    try {
      const response = await axios.get(`${esewaConfig.baseUrl}/api/epay/transaction/status/?product_code=${decodedData.product_code}&total_amount=${decodedData.total_amount}&transaction_uuid=${decodedData.transaction_uuid}`);
      if (response.data.status === 'COMPLETE') {
        return res.redirect('http://localhost:5173/success?status=success');
      } else {
        return res.redirect(`http://localhost:5173/failure?message=${response.data.status}`);
      }
    } catch (error) {
      console.error('Error verifying payment:', error.response ? error.response.data : error.message);
      return res.redirect('http://localhost:5173/failure?message=Failed to verify payment');
    }
  } else {
    return res.redirect('http://localhost:5173/failure?message=Invalid signature');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
