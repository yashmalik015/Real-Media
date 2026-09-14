import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: 'rzp_test_Tb9IfGhbXRGZWj',
  key_secret: 'IAlsRh9tAJ2oiSZJuZiF3qpq',
})

async function test() {
  try {
    const order = await razorpay.orders.create({
      amount: 14900,
      currency: 'INR',
      receipt: 'test_receipt',
    })
    console.log("Success:", order)
  } catch (error) {
    console.error("Failed:", error)
  }
}
test()
