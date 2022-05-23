const axios = require('axios')
const converter = require('json-2-csv')
const fs = require('fs')
const prompt = require('prompts')

let csv = []

const getPurchase = (cursor, userid, cookie) => {
    axios.get(`https://economy.roblox.com/v2/users/${userid}/transactions?transactionType=Purchase&limit=100&cursor=${cursor}`, {
            headers: {
                'Cookie': `.ROBLOSECURITY=${cookie}`,
            }

        })
        .then(response => {
            for (const purchase of response.data.data) {

                csv.push({
                    "name": purchase.details.name,
                    "id": purchase.id,
                    "amount": Math.abs(purchase.currency.amount),
                    "currency": purchase.currency.type,
                    "type": purchase.details.type,
                    "purchased": purchase.created,
                    "seller_id": purchase.agent.id,
                    "seller_name": purchase.agent.name,
                    "seller_type": purchase.agent.type,
                })

                console.log(`Purchased ${purchase.details.name} (${purchase.details.id}) on ${purchase.created} for ${Math.abs(purchase.currency.amount)} ${purchase.currency.type}`)
            }

            if (response.data.nextPageCursor) {
                getPurchase(response.data.nextPageCursor, userid, cookie)
            } else {

                converter.json2csv(csv, (err, csvString) => {

                    if (err) {
                        return console.log(`COULD NOT CONVERT TO CSV: ${err}`)
                    }

                    fs.writeFile(`./purchases.csv`, csvString, (err) => {

                        if (err) {
                            return console.log(`COULD NOT SAVE TO CSV: ${err}`)
                        }

                    })


                })
            }

        })
}

(async () => {
    const response = await prompt([{
        type: 'number',
        name: 'userid',
        message: 'Enter your UserId'
    }, {
        type: 'password',
        name: 'cookie',
        message: 'Enter your .ROBLOSECURITY cookie'
    }])

    getPurchase("", response.userid, response.cookie)
})()