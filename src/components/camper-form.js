import * as React from 'react';
import * as ui from './ui';
import { InputLabel, MenuItem, FormControl, Select, TextField, Typography } from '@mui/material';


export default function CamperForm(props) {
    const [age, setAge] = React.useState(7);
    const [name, setName] = React.useState("");
    const { handleChange, index } = props;

    React.useEffect(() => {
        handleChange(index, name, age);
    }, [name, age, handleChange, index]);

    const handleAgeChange = (event) => {
        setAge(event.target.value);
    };

    const handleNameChange = (event) => {
        setName(event.target.value);
    }

    return (
        <>
            <ui.Flex variant={"center"}>
                <Typography variant="h5">Camper {props.index + 1}</Typography>
                <FormControl sx={{ m: 2 }} variant="standard">
                    <TextField required id={"camperName" + props.index} label="Name" variant="filled" onChange={handleNameChange} value={name} />
                </FormControl>
                <FormControl sx={{ m: 2 }} variant="standard">
                    <InputLabel id="camperAgeLabel">Age</InputLabel>
                    <Select
                        labelId="camperAgeLabel"
                        id={"camperAge" + props.index}
                        value={age}
                        onChange={handleAgeChange}
                    >
                        {Array.from({ length: 6 }).map((it, index) => {
                            return (<MenuItem value={index + 7
                            } key={`menuItem${index}`}>
                                {index + 7}
                            </MenuItem>)
                        })}
                    </Select>
                </FormControl>
            </ui.Flex >
        </>

    );
}