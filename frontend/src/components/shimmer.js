export const Shimmer=()=>{
    return(
        <div className="flex flex-wrap justify-center gap-6 p-6">        
       {Array(20).fill("").map((_,index)=>(<div key={index} className="w-52 h-80 bg-gray-200 m-5"></div>))}
        </div>
    )
}