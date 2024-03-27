// ////
// import React, { useState } from "react";
// import CheckUser from "../utils/checkUser";
// import { useNavigate, useLocation, useParams } from "react-router-dom";
// import { handleTicketBooking } from "../utils/Authentication";

// function loadScript(src) {
//     return new Promise((resolve) => {
//         const script = document.createElement('script')
//         script.src = src
//         script.onload = () => {
//             resolve(true)
//         }
//         script.onerror = () => {
//             resolve(false)
//         }
//         document.body.appendChild(script)
//     })
// }
// const BookTicket = () => {
//     const navigate = useNavigate()
//     const location = useLocation()
//     // const { date } = location.state
//     const [input, setInput] = useState(0);
//     const [total, setTotal] = useState(0);

//     const movieId = useParams().movieId
//     const userId = useParams().userId


//     const handleChange = (e) => {
//         const value = parseInt(e.target.value);
//         if (isNaN(value) || value < 0) {
//             setInput(0);
//         } else {
//             setInput(value);
//             setTotal(value*100)
//         }
//     };


//     // const handleSubmit = (e) => {
//     //     e.preventDefault();

//     //     if (!userId.trim() || !movieId.trim() || !date.trim() || input === 0) {
//     //         console.log("submit error");
//     //         return;
//     //     }
//     //     const isoDate = new Date(date).toISOString();
//     //     handleTicketBooking({ userId, movieId, date: isoDate, numberOfTickets: input })
//     //         .then((res) => {
//     //             navigate("/")
//     //             console.log(res);

//     //         }).catch((error) => {
//     //             console.log(error);
//     //         });
//     // };

//     const buttonClass = () => {
//         if (input <= 0 || isNaN(input)) {
//             return "btn btn-info col-6 disabled";
//         } else {
//             return "btn btn-info col-6";
//         }
//     };


//     async function displayRazorpay(e) {
//         e.preventDefault()

//         const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js')

//         if (!res) {
//             alert('Razropay failed to load!!')
//             return
//         }

//         const data = await fetch('http://localhost:5000/booking/razorpay', { method: 'POST' })

//         console.log(data)

//         const options = {
//             "key":  "rzp_test_ptuB1337S8wVQM", // Enter the Key ID generated from the Dashboard
//             "amount": total.toString(), // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
//             "currency": data.currency,
//             "name": "Gokul G Nair",
//             "description": "Test Transaction",
//             "image": "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/007c7812124161.56257a66483ee.jpg",
//             "order_id": data.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
//             "callback_url": `http://localhost:3000/user/${userId}/myBookings`,
//             "notes": {
//                 "address": "Razorpay Corporate Office"
//             },
//             "theme": {
//                 "color": "#3399cc"
//             }


//         };
//         const paymentObject = new window.Razorpay(options);
//         paymentObject.open();
//     }

//     return (
//         <div className="d-flex justify-content-center align-items-center mt-24">
//             <div className="rounded-lg bg-white p-4 shadow" style={{ maxWidth: '400px' }}>
//                 <form >
//                     <div className="form-group">
//                         <h4><b>Book Your Tickets</b></h4>
//                         <p className="text-secondary">Please enter the number of tickets</p>
//                         <div className="form-group">
//                             <input type="number" className="form-control mt-3" placeholder="Number Of Tickets" onChange={handleChange} value={input} />
//                         </div>
//                         <div className="bg-gray-300 border border-black p-4 m-4 rounded-md text-center">
//                             {/* <p>{date}</p> */}
//                             <p>{input} tickets x ₹1</p>
//                             <p>₹{input * 1}</p>
//                         </div>
//                         <div className="row justify-content-center mt-4">
//                             <button onClick={displayRazorpay} className={buttonClass()}>Proceed</button>
//                         </div>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// }

// export default CheckUser(BookTicket);
////
import React, { useState } from "react";
import CheckUser from "../utils/checkUser";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { handleTicketBooking } from "../utils/Authentication";


function loadScript(src) {
    return new Promise((resolve) => {
        const script = document.createElement('script')
        script.src = src
        script.onload = () => {
            resolve(true)
        }
        script.onerror = () => {
            resolve(false)
        }
        document.body.appendChild(script)
    })
}


const BookTicket = () => {
    const navigate = useNavigate()
    // const location =useLocation()
    // const {timing}=location.state
    const [input, setInput] = useState(0);
    const movieId = useParams().movieId
    const userId = useParams().userId
    const showId = useParams().showId



    const handleChange = (e) => {
        const value = parseInt(e.target.value);
        if (isNaN(value) || value < 0) {
            setInput(0);
        } else {
            setInput(value);
        }
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        if (!userId.trim() || !movieId.trim() || !showId.trim() || input === 0) {
            console.log("submit error");
            return;
        }
        handleTicketBooking({ userId, movieId, showId, numberOfTickets: input })
            .then((res) => {
                navigate("/")
                console.log(res);

            }).catch((error) => {
                console.log(error);
            });
    };

    const buttonClass = () => {
        if (input <= 0 || isNaN(input)) {
            return "btn btn-info col-6 disabled";
        } else {
            return "btn btn-info col-6";
        }
    };



    async function displayRazorpay(e) {
        e.preventDefault()

        const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js')

        if (!res) {
            alert('Razropay failed to load!!')
            return
        }

        const data = await fetch('http://localhost:5000/booking/razorpay', { method: 'POST' })

        console.log(data)

        const options = {
            "key": "rzp_test_ptuB1337S8wVQM", // Enter the Key ID generated from the Dashboard
            "amount": input*100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
            "currency": data.currency,
            "name": "Gokul G Nair",
            "description": "Test Transaction",
            "image": "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/007c7812124161.56257a66483ee.jpg",
            "order_id": data.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
            "callback_url": `http://localhost:3000/user/${userId}/myBookings`,
            "notes": {
                "address": "Razorpay Corporate Office"
            },
            "theme": {
                "color": "#3399cc"
            }


        };
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
    }

    return (
        <div className="d-flex justify-content-center align-items-center mt-24">
            <div className="rounded-lg bg-white p-4 shadow" style={{ maxWidth: '400px' }}>
                <form method="POST" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <h4><b>Book Your Tickets</b></h4>
                        <p className="text-secondary">Please enter the number of tickets</p>
                        <div className="form-group">
                            <input type="number" className="form-control mt-3" placeholder="Number Of Tickets" onChange={handleChange} value={input} />
                        </div>
                        <div className="bg-gray-300 border border-black p-4 m-4 rounded-md text-center">
                            <p>{input} tickets x ₹100</p>
                            <p>₹{input * 100}</p>
                        </div>
                        <div className="row justify-content-center mt-4">
                            <button type="submit" className={buttonClass()}>Book</button>
                        </div>
                        <div className="row justify-content-center mt-4">
                            <button onClick={displayRazorpay} className={buttonClass()}>Proceed</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CheckUser(BookTicket);
