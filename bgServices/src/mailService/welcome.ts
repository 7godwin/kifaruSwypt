import mssql from 'mssql'
import { sqlConfig } from '../sqlConfig/sqlConfig'
import ejs from 'ejs'
import { sendMail } from '../helpers/emailHelpers'

// dotenv.config()  
// import dotenv from 'dotenv'

export const welcomeUser = async () => {
    const pool = await mssql.connect(sqlConfig)

    const users = (await pool.request().execute("WELCOMEUSER")).recordset

    console.log(users);

    for (let user of users) {
        ejs.renderFile('templates/welcome.ejs', { firstName: user.firstName }, async (error, data) => {
            let mailOptions = {
                from: "compgodwin@gmail.com",
                to: user.email,
                subject: "Welcome to TUUZE",
                html: data
            }

            try {
                await sendMail(mailOptions)

                await pool.request().query('UPDATE Users SET isWelcomed = 1 WHERE isWelcomed = 0 AND isDeleted = 0')

                console.log("Emails sent to new users");

            } catch (error) {
                console.log(error);

            }
        })
    }
}
