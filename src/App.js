import './App.css';
import moment from 'moment';
import { useEffect, useState, useMemo } from 'react'
import DataTable from 'react-data-table-component'
import { OPENSEA_URL } from './constants/huxley'

const stateToString = (state) => {
  switch (state) {
    case 0:
      return 'pure'
    case 1:
      return 'redeemed only'
    case 2:
      return 'blocked only'
    case 3:
      return 'both'
    default:
      return 'unknown'
  }
}

const columns = [
  {
    name: 'Image',
    selector: row => row.image_preview_url,
    cell: row => <img src={row.image_preview_url} alt='unkown' height="30" data-tag="allowRowEvents" />,
    sortable: true,
    maxWidth: '20px',
  },
  {
    name: 'Created',
    selector: row => row.created_date,
    format: row => moment(row.created_date).format(),
    sortable: true,
  },
  {
    name: 'Token ID',
    selector: row => row.token_id,
    sortable: true,
    maxWidth: '20px',
  },
  {
    name: 'Name',
    selector: row => row.name,
    sortable: true,
  },
  {
    name: 'Price',
    selector: row => row.starting_eth,
    sortable: true,
    maxWidth: '20px',
  },
  {
    name: 'Sold?',
    selector: row => row.total_eth,
    format: row => row.total_eth ? 'Sold' : '',
    sortable: true,
    maxWidth: '20px',
  },
  {
    name: 'State',
    selector: row => row.state,
    format: row => stateToString(row.state),
    sortable: true,
},
];

function App() {
  const [events, setEvents] = useState([])
  const [pending, setPending] = useState(true)
  const [filterText, setFilterText] = useState('');
	const [resetPaginationToggle, setResetPaginationToggle] = useState(false); //	paginationResetDefaultPage={resetPaginationToggle} // optionally, a hook to reset pagination to page 1
	const filteredEvents = events.filter(item => item.name && item.name.toLowerCase().includes(filterText.toLowerCase()))
  // || item.state.includes(filterText.toLowerCase())

	const subHeaderComponentMemo = useMemo(() => {
		const handleClear = (e) => {
			if (filterText) {
        e.preventDefault();
				setResetPaginationToggle(!resetPaginationToggle);
				setFilterText('');
			}
		};

		return (
      <div>
			  <input id="filter" type="text" value={filterText} onChange={e => setFilterText(e.target.value)} placeholder="Search" />
        <button onClick={handleClear}>X</button>
      </div>
		);
	}, [filterText, resetPaginationToggle]);

  const fetchEvents = async () => {
    const resp = await fetch(process.env.REACT_APP_WORKER_URL)
    const allEvents = await resp.json()
    setEvents(allEvents)
    setPending(false)
  }

  const onRowClicked = ({ token_id }) => window.open(OPENSEA_URL + token_id)

  useEffect(() => {
    fetchEvents();
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Last Huxley Issue 1 Listings
        </p>
      </header>
      <div className="App-body">
        {subHeaderComponentMemo}
        <DataTable
          columns={columns}
          data={filteredEvents}
          onRowClicked={onRowClicked}
          progressPending={pending}
          persistTableHead
        />
        {/*events.map((event) =>
          <a key={event.id} href={OPENSEA_URL + event.token_id} target="blank_">
            <img src={event.image_preview_url} />
          </a>
        )*/}
      </div>
    </div>
  );
}

export default App;
