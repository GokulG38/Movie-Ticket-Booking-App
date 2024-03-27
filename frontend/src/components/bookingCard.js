import React, { useState, useEffect } from "react";
import axios from "axios";
import QRCode from "qrcode";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const getDefaultShowTime = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");
  const defaultTime = `${year}-${month}-${day}T11:30`;
  return defaultTime;
};

const BookingCard = ({ numberOfTickets, showId, movie, _id, totalAmount }) => {
  const [movieDetails, setMovieDetails] = useState({
    title: "",
    description: "",
    posterUrl: "",
    starring: "",
    disabled: false,
    shows: [{ showTime: getDefaultShowTime(), availableSeats: 0 }],
  });

  useEffect(() => {
    getMovieDetails();
  }, []);

  const formatDate = (dateTimeString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    return new Date(dateTimeString).toLocaleDateString(undefined, options);
  };

  async function getMovieDetails() {
    try {
      const { data } = await axios.get(`http://www.localhost:5000/movies/${movie}`);
      setMovieDetails(data.movie);
    } catch (error) {
      console.log(error);
    }
  }

  const generateQRCode = async () => {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(_id);
      return qrCodeDataUrl;
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const downloadTicket = async () => {
    try {
        const qrCodeDataUrl = await generateQRCode();
        if (!movieDetails.title) {
            await getMovieDetails();
        }
        const matchingShow = movieDetails.shows.find((show) => show._id === showId);
        if (!matchingShow) {
            throw new Error("Show not found");
        }
        const showTimeText = formatDate(matchingShow.showTime);

        const docDefinition = {
            content: [
                { text: "Movie Ticket", style: "header" },
                { text: `Movie: ${movieDetails.title}`, style: "subheader" },
                { text: `Date: ${showTimeText}`, style: "subheader" },
                { text: `Number Of Tickets: ${numberOfTickets}`, style: "subheader" },
                { text: `Total Ticket Price: ${totalAmount?("Rs "+totalAmount/100):"Not available"}`, style: "subheader" },
                { text: `Booking ID: ${_id}`, style: "subheader" },
                { image: qrCodeDataUrl, width: 200, alignment: "center" },
            ],
            styles: {
                header: { fontSize: 22, bold: true, margin: [0, 0, 0, 10] },
                subheader: { fontSize: 16, bold: true, margin: [0, 10, 0, 5] },
            },
        };

        pdfMake.createPdf(docDefinition).download(`${movieDetails.title}.pdf`);
    } catch (error) {
        console.error("Error generating ticket:", error);
    }
};


if (!movieDetails.shows.find((show) => show._id === showId)) {
  return null;
}
  return (
    <div className="w-80 p-4 m-2 border-2 border-solid border-black rounded-lg hover:bg-slate-200">
      <img src={`${movieDetails.posterUrl}`} alt="Movie Poster" />
      <h4>{movieDetails.title}</h4>
      <span>{formatDate(movieDetails.shows.filter((show) => show._id === showId)[0]?.showTime)}</span>
      <br />
      <span>Number Of Tickets - {numberOfTickets}</span>
      <br />
      <span>Booking ID - {_id}</span>
      <br />
      <button className="btn btn-info m-2" onClick={downloadTicket}>
        Download Ticket
      </button>
    </div>
  );
};

export default BookingCard;
