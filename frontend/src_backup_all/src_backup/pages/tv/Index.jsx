import { Link, Outlet } from 'react-router-dom'
export default function TVIndex(){
  return (
    <div className='p-6'>
      <h2 className='text-2xl font-bold mb-3'>TV Stations</h2>
      <div className='flex gap-4 flex-wrap mb-6 underline'>
        <Link to='texasgottalent'>Texas Got Talent</Link>
        <Link to='nolimiteasthouston'>No Limit East Houston</Link>
        <Link to='civicconnect'>Civic Connect</Link>
      </div>
      <Outlet/>
    </div>
  )
}
