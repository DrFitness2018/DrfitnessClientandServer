// const express = require("express")
// const app = express()
// require("dotenv").config()
// const stripe = require("stripe")("sk_test_51KV05EE6nbSSxCIjJYV0hJHMh9J1n9nSsD2jOk1tO0PapVypyuzNxvSPXD6OrAOaF77usfYFo4MaO2fYgLwrbnvB00M2mvLRQp")
// const bodyParser = require("body-parser")
// const cors = require("cors")

// app.use(bodyParser.urlencoded({ extended: true }))
// app.use(bodyParser.json())

// app.use(cors())

// app.post("/payment", cors(), async (req, res) => {
// 	let { amount, id } = req.body
// 	try {
// 		const payment = await stripe.paymentIntents.create({
// 			amount,
// 			currency: "USD",
// 			description: "Spatula company",
// 			payment_method: id,
// 			confirm: true
// 		})
// 		console.log("Payment", payment)
// 		res.json({
// 			message: "Payment successful",
// 			success: true
// 		})
// 	} catch (error) {
// 		console.log("Error", error)
// 		res.json({
// 			message: "Payment failed",
// 			success: false
// 		})
// 	}
// })

// app.listen(process.env.PORT || 4000, () => {
// 	console.log("Sever is listening on port 4000")
// })
const cors = require("cors");
const express = require("express");
const stripe = require("stripe")("sk_test_51KV05EE6nbSSxCIjJYV0hJHMh9J1n9nSsD2jOk1tO0PapVypyuzNxvSPXD6OrAOaF77usfYFo4MaO2fYgLwrbnvB00M2mvLRQp");
const uuid = require("uuid/v4");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Add your Stripe Secret Key to the .require('stripe') statement!");
});

app.post("/checkout", async (req, res) => {
  console.log("Request:", req.body);

  let error;
  let status;
  try {
    const { 
		userid,
		uname,
		price,
		feesFromModaluid, token } = req.body;

    const customer = await stripe.customers.create({
      email: token.email,
      source: token.id
    });

    const idempotency_key = uuid();
    const charge = await stripe.charges.create(
      {
        amount: price * 100,
        currency: "usd",
        customer: customer.id,
        receipt_email: token.email,
        description: `Appointment By Name :${uname} Id :${userid} From ${feesFromModaluid}`,
        shipping: {
          name: token.card.name,
          address: {
            line1: token.card.address_line1,
            line2: token.card.address_line2,
            city: token.card.address_city,
            country: token.card.address_country,
            postal_code: token.card.address_zip
          }
        }
      },
      {
        idempotency_key
      }
    );
    console.log("Charge:", { charge });
    status = "success";
  } catch (error) {
    console.error("Error:", error);
    status = "failure";
  }

  res.json({ error, status });
});

app.listen(process.env.PORT || 4000, () => {
	console.log("Sever is listening on port 4000")
})