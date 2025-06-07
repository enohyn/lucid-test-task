
import './App.css'
import { FormulaTable } from './components/FormulaTable'

function App() {

  return (
    <div className='h-screen w-screen bg-white flex flex-col py-2 items-center justify-center'>
      <h1 className='text-2xl font-bold mb-4 text-[#0f0f0f]'>Formula Editor</h1>
      <FormulaTable />
    </div>
  )
}

export default App
