import * as React from 'react';
import * as ui from './ui';

export default function CamperSelect(props) {
    return <ui.Flex variant="center" responsive={true}>
        <ui.Subhead># of campers: </ui.Subhead>
        <input
            id="camperInput"
            type="number"
            defaultValue={1}
            min="1"
            onChange={props.handleChange}
        />
    </ui.Flex>
}