import * as React from 'react';
import * as ui from './ui';
import { TextField } from '@mui/material';

export default function CamperSelect(props) {
    return <ui.Flex variant="center" responsive={true}>
        <ui.Subhead># of campers: </ui.Subhead>
        <TextField
            id="camperInput"
            type="number"
            defaultValue={1}
            min="1"
            onChange={props.handleChange}
        />
    </ui.Flex>
}