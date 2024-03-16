import * as React from 'react';
import * as ui from './ui';
import { Tooltip, Checkbox } from '@mui/material';

export function WeeklyList(props) {
    const result = props.weeks
    return (
        <ui.FlexList variant='spaceBetween'>
            {result.map((date) => {
                var startDate = date[0]
                var endDate = date[1]
                return (
                    <ui.List as='li' key={startDate.replace(/ /g, '')}>
                        <ui.Base as='label' className={'PillList-item'}>
                            <input id={startDate} type="checkbox" name={props.name} value={startDate} onChange={props.handleSelect} />

                            {startDate === 'Jul 01' ?
                                <Tooltip title={'40% discount! Closed 7/4 & 7/5'} placement="top">
                                    <span id={startDate + '-span'} className="PillList-label">
                                        {`${startDate} - ${endDate}*`}
                                    </span>
                                </Tooltip> :
                                <span id={startDate + '-span'} className="PillList-label">
                                    {`${startDate} - ${endDate}`}
                                </span>
                            }
                        </ui.Base>
                        <br />
                        <input type="checkbox" id={startDate + "-precare"} name="precare" onChange={props.handleCareType} />
                        <span>Precare</span>
                        <br />
                        <input type="checkbox" id={startDate + "-postcare"} name="postcare" onChange={props.handleCareType} />
                        <span>Postcare</span>
                    </ui.List>
                )
            })}
        </ui.FlexList>
    )
}
