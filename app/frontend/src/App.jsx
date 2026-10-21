import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Form from './Page/Form/Form'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route index path='/' element={<Form/>}/>
        </Routes>
      </BrowserRouter>

    </>
  )
}

export default App
