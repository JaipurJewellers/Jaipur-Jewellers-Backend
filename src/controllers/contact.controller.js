import { mail_contact } from "./emailServices.js";

export const contact_sender = async(req,res) => {
    try{
        const {name,email,message} = req.body;
        console.log("Contact called");
        if(!name || !email || !message)
        {
            res.status(400).json({message:"All fields are Necessary",});
        }

        mail_contact(req.body);
        res.status(200).json({message:`Contactus Details Sent to ${email}`});
    }
    catch(e)
    {
        res.status(500).json({message:"Internal Server Error"});
    }
}
