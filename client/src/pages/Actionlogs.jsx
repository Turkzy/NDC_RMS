import React, {useState, useEffect} from 'react'
import api, { endpoints } from '../config/api'

const Actionlogs = () => {
  const [actionlogs, setActionlogs] = useState([]);
  const [expanded, setExpanded] = useState({});
  

  useEffect(() => {
    const fetchActionlogs = async () => {
      const res = await api.get(endpoints.actionlogs.getAllActionlogs);
      setActionlogs(res.data.actionlogs);
    }
    fetchActionlogs();
  }, []);

  return (
    <div>Actionlogs</div>
  )
}

export default Actionlogs