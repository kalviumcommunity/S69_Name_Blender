import React from 'react'
import LandingPage from './pages/LandingPage'
import './App.css'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Data from './pages/data'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/landing' element={<LandingPage/>}></Route>
        {/* <Navbar/> */}
        <Route path='/' element={<Data/>} ></Route>
        {/* <Home/>  */}
        </Routes>
      
      </BrowserRouter>
    
  )
}

export default App
