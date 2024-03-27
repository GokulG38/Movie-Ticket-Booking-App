import axios from 'axios';

const sendAdminLogRequest = async (data) => {
    try {
        const response = await axios.post('http://localhost:5000/admin/login', {
            email: data.email,
            password: data.password
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

const sendUserLogRequest = async (data) => {
    try {
        const response = await axios.post('http://localhost:5000/user/login', {
            email: data.email,
            password: data.password
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

const handleTicketBooking = async ({ userId, movieId, showId, numberOfTickets }) => {
    try {
        const userToken = localStorage.getItem('userToken');
        if (!userToken) throw new Error('User token not found');

        const config = { headers: { 'Authorization': `Bearer ${userToken}` } };
        const data = { user:userId, movie:movieId, showId, numberOfTickets }; 
        console.log(data)
        const response = await axios.post('http://localhost:5000/booking/add', data, config);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const handleMovieUpdates=async(movieId, input)=>{
    try{
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) throw new Error('Admin token not found');

        const config = { headers: { 'Authorization': `Bearer ${adminToken}` } };
        const response = await axios.put(`http://www.localhost:5000/movies/update/${movieId}`,{
            title: input.title,
            description: input.description,
            posterUrl: input.posterUrl,
            starring: input.starring,
            disabled: input.disabled,
            ticketPrice: input.ticketPrice,
            shows: input.shows
        },config);
        return response.data
        
    }catch(error){
        console.log(error)
    }
}


const handleAddMovie =async(input)=>{
    try{
        console.log("hello")

        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) throw new Error('Admin token not found');

        const config = { headers: { 'Authorization': `Bearer ${adminToken}` } };
        const response = await axios.post(`http://www.localhost:5000/movies/add`,{
            title: input.title,
            description: input.description,
            posterUrl: input.posterUrl,
            starring: input.starring,
            disabled: input.disabled,
            ticketPrice: input.ticketPrice,
            shows: input.shows
        },config);
        return response.data
        
    }catch(error){
        console.log(error)
    }
}
const handleSignup = async(input)=>{
    try{
        const response = await axios.post("http://www.localhost:5000/user/signup",{
            name:input.name,
            email:input.email,
            password:input.password
        })
        return response.data
    }catch(error){
        throw error
    }
}

export { sendAdminLogRequest, sendUserLogRequest, handleTicketBooking, handleMovieUpdates , handleSignup, handleAddMovie};
