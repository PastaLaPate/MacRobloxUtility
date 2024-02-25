import logo from './logo.svg';
import './App.css';
import {
	Alert,
	Box,
	Button,
	Checkbox,
	List,
	ListItem,
	ListItemText,
	Snackbar,
	TextField,
	InputAdornment,
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { FixedSizeList } from 'react-window';
import SearchIcon from '@mui/icons-material/Search';
import Minisearch from 'minisearch';

function App() {
	const client = axios.create({
		baseURL: 'http://localhost:39457',
	});
	const [SBOpen, setSBOpen] = useState(false);
	const [SBMessage, setSBMessage] = useState('');
	const [SBSeverity, setSBSeverity] = useState('info');
	const [FFlags, setFFlags] = useState([
		{
			behaviour: 'X',
			name: 'Loading...',
			type: 'bool',
		},
	]);
	const [searchResults, setSearchResults] = useState([]);
	const [search, setSearch] = useState('');

	const [searcher, setSearcher] = useState(null);
	const [fflagRender, setFFlagRender] = useState(null);

	const openRoblox = async () => {
		const resp = await client.get('/openRoblox');
		if (resp.data.error) {
			setSBSeverity('error');
			setSBMessage(resp.data.error);
			setSBOpen(true);
		} else {
			setSBSeverity('success');
			setSBMessage('Successfully opened roblox');
			setSBOpen(true);
		}
	};

	const closeRoblox = async () => {
		const resp = await client.get('/closeRoblox');
		if (resp.data.error) {
			setSBSeverity('error');
			setSBMessage(resp.data.error);
			setSBOpen(true);
		} else {
			setSBSeverity('success');
			setSBMessage('Successfully closed roblox');
			setSBOpen(true);
		}
	};

	const updateFFlags = async () => {
		const resp = await client.get('/getParsedFFLags');
		if (resp.data.error) {
			setSBSeverity('error');
			setSBMessage(resp.data.error);
			setSBOpen(true);
		} else {
			const fflags = resp.data.fflags;
			setFFlags(fflags);
			var temp = [];
			FFlags.forEach((v, i) => {
				temp.push({
					id: i,
					additionalName: v.name.split(/(?=[A-Z])/).join(' '),
					...v,
				});
			});
			const tempSearcher = new Minisearch({
				fields: ['name', 'behaviour', 'type', 'additionalName'],
				storeFields: ['name', 'behaviour', 'type'],
			});
			tempSearcher.addAll(temp);
			setSearcher(tempSearcher);
			setSBSeverity('success');
			setSBMessage('Successfully updated list of fflags!');
			setSBOpen(true);
		}
	};

	useEffect(() => {
		updateFFlags();
	}, []);

	const [checkedItems, setCheckedItems] = useState({});
	const [textValues, setTextValues] = useState({});

	const handleCheckboxChange = (index) => (event) => {
		console.log('Setting to ', event.target.checked);
		setCheckedItems({ ...checkedItems, [index]: event.target.checked });
		console.log(checkedItems);
	};

	const handleTextChange = (index) => (event) => {
		setTextValues({ ...textValues, [index]: event.target.value });
	};

	useEffect(() => {
		setFFlagRender(
			<FixedSizeList
				height={500}
				width={600}
				itemCount={
					searchResults.length === 0
						? FFlags.length
						: searchResults.length
				}
				sx={{
					maxHeight: 300,
					overflow: 'auto',
				}}
				itemSize={100}
				overscanCount={5}
			>
				{(props) => {
					const { index, style } = props;
					const fflag = (
						searchResults.length === 0 ? FFlags : searchResults
					)[index];
					return (
						<ListItem
							style={style}
							key={index}
							component="div"
							disablePadding
							secondaryAction={
								fflag.type === 'bool' ? (
									<Checkbox
										checked={checkedItems[index] || false}
										onChange={handleCheckboxChange(index)}
									/>
								) : (
									<TextField
										value={textValues[index] || ''}
										onChange={(e) => {
											if (fflag.type === 'int') {
												if (parseInt(e.target.value)) {
													handleTextChange(index)(e);
												}
											} else {
												handleTextChange(index)(e);
											}
										}}
									/>
								)
							}
						>
							<ListItemText sx={{ color: 'white' }}>
								{fflag.name}
							</ListItemText>
						</ListItem>
					);
				}}
			</FixedSizeList>
		);
	}, [searchResults, FFlags, checkedItems, textValues]);

	const searchFunc = (search) => {
		if (search !== '') {
			const results = searcher.search(search);
			console.log('Searching');
			console.log(results);
			setSearchResults(results);
		} else {
			setSearchResults([]);
		}
	};

	return (
		<Box style={{ width: '100%', height: '100%' }}>
			<Box
				display={'flex'}
				justifyContent={'center'}
				alignItems={'center'}
				sx={{
					width: '100vw',
					height: '100vh',
				}}
			>
				<Box
					display={'flex'}
					justifyContent={'center'}
					alignItems={'center'}
					flexDirection={'column'}
					sx={{ p: 3, bgcolor: '#001e41', borderRadius: 5 }}
				>
					<Box display={'flex'} flexDirection={'column'}>
						<TextField
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								searchFunc(e.target.value);
							}}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon />
									</InputAdornment>
								),
							}}
						/>
						{fflagRender}
					</Box>
					<Box>
						<Button
							color="success"
							variant="contained"
							onClick={openRoblox}
							sx={{
								color: 'white',
							}}
						>
							Open Roblox
						</Button>
						<Button
							color="error"
							variant="contained"
							onClick={closeRoblox}
							sx={{
								color: 'white',
								m: 1,
							}}
						>
							Close Roblox
						</Button>
					</Box>
				</Box>
			</Box>
			<Snackbar
				onClose={() => {
					setSBOpen(false);
				}}
				open={SBOpen}
				autoHideDuration={1200}
			>
				<Alert
					severity={SBSeverity}
					variant="filled"
					onClose={() => {
						setSBOpen(false);
					}}
				>
					{SBMessage}
				</Alert>
			</Snackbar>
		</Box>
	);
}

export default App;
