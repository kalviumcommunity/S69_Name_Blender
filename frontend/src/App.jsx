import React from 'react'
import LandingPage from './pages/LandingPage'
import './App.css'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Data from './pages/data'
import SignUpPage from './pages/signup'
import Update from '../components/Update'
import Delete from '../components/Delete'


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/landing' element={<LandingPage/>}></Route>
        {/* <Navbar/> */}
        <Route path='/' element={<Data/>} ></Route>
        {/* <Home/>  */}
        <Route path='/signup' element={<SignUpPage/>}></Route>
        <Route path='/update/:email' element={<Update/>}></Route>
        <Route path='/delete/:email' element={<Delete/>}></Route>
        </Routes>
      
      </BrowserRouter>
    
  )
}

export default App
