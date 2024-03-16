import { Button, FormControl, TextField, IconButton } from '@mui/material';
import * as React from 'react';

export default function DiscountForm(props) {
    const [code, setCode] = React.useState("");
    const { onSubmit } = props;

    return (
        <FormControl sx={{ m: 2 }}>
            <TextField label="Discount Code" variant="filled" onChange={(ev) => setCode(ev.target.value)} value={code} />
            <Button variant="contained" onClick={() => onSubmit(code)}>Submit</Button>
        </FormControl>
    )
}
