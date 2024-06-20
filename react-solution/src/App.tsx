import { useEffect, useState } from 'react'
import './App.css'
import FetchData from './data/FetchData';
import RiskRewardGraph from './components/RiskRewardGraph';
import { OptionContract } from './data/OptionType';


function App() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Array<OptionContract> | string>()

  useEffect(() => {
    loadData();
    return () => { }
  }, [])

  const loadData = async () => {
    const data = await FetchData();
    setData(data);
    setLoading(false);
  }
  // check if the data loaded correctly or display error
  const checkData = () => Array.isArray(data) ? <RiskRewardGraph options={data} /> : data;

  return (
    <>
      {loading ? <i className='spinner' /> : checkData()}
    </>
  )
}

export default App
