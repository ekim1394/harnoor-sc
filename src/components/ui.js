import { Link as GatsbyLink } from "gatsby"
import isAbsoluteURL from "is-absolute-url"
import * as React from "react"
import * as styles from "./ui.css"
import "../styles/pillbox.css"
import Tooltip from '@mui/material/Tooltip';

export const cx = (...args) => args.filter(Boolean).join(" ")

export function Base({
    as: Component = "div",
    cx: _cx = [],
    className,
    ...props
}) {
    return <Component className={cx(..._cx, className)} {...props} />
}

export function Container({ width = "normal", ...props }) {
    return <Base cx={[styles.containers[width]]} {...props} />
}

export function Flex({
    variant,
    gap = 3,
    gutter,
    wrap,
    responsive,
    marginY,
    alignItems,
    cx: _cx = [],
    ...props
}) {
    return (
        <Base
            cx={[
                styles.flex,
                variant && styles.flexVariants[variant],
                responsive && styles.flexVariants.responsive,
                wrap && styles.flexVariants.wrap,
                gutter && styles.gutter[gutter],
                gutter ? styles.flexGap[0] : styles.flexGap[gap],
                marginY && styles.marginY[marginY],
                alignItems && styles.flexVariants[alignItems],
                ..._cx,
            ]}
            {...props}
        />
    )
}

export function Box({
    width = "full",
    background,
    padding,
    paddingY,
    radius,
    center = false,
    order,
    cx: _cx = [],
    ...props
}) {
    return (
        <Base
            cx={[
                styles.widths[width],
                background && styles.backgrounds[background],
                padding && styles.padding[padding],
                paddingY && styles.paddingY[paddingY],
                radius && styles.radii[radius],
                center && styles.box.center,
                order && styles.order[order],
                ..._cx,
            ]}
            {...props}
        />
    )
}

export function FlexList(props) {
    return <Flex as="ul" cx={[styles.list]} {...props} />
}

export function List(props) {
    return <Base as="ul" cx={[styles.list]} {...props} />
}

export function Space({ size = "auto", ...props }) {
    return <Base cx={[styles.margin[size]]} {...props} />
}

export function Nudge({ left, right, top, bottom, ...props }) {
    return (
        <Base
            cx={[
                left && styles.marginLeft[-left],
                right && styles.marginRight[-right],
                top && styles.marginTop[-top],
                bottom && styles.marginBottom[-bottom],
            ]}
            {...props}
        />
    )
}

export function Section(props) {
    return <Box as="section" className={styles.section} {...props} />
}

export function Text({
    variant = "body",
    center = false,
    bold = false,
    ...props
}) {
    return (
        <Base
            cx={[
                styles.text[variant],
                center && styles.text.center,
                bold && styles.text.bold,
            ]}
            {...props}
        />
    )
}

export function SuperHeading({ ...props }) {
    return <Text as="h1" variant="superHeading" {...props} />
}

export function Heading({ ...props }) {
    return <Text as="h2" variant="heading" {...props} />
}

export function Subhead({ ...props }) {
    return <Text as="h3" variant="subhead" {...props} />
}

export function Link({ to, href, ...props }) {
    const url = href || to || ""
    if (isAbsoluteURL(url)) {
        return (
            // eslint-disable-next-line jsx-a11y/anchor-has-content
            <a href={url} className={styles.link} state={{
                modal: true
            }} {...props} />
        )
    }
    return <GatsbyLink to={url} className={styles.link} {...props} />
}

export function PillBox(props) {
    return (
        <Base as='label' className={'PillList-item'}>
            <input type="checkbox" id={props.id} name={props.name} value={props.value} onChange={props.handleSelect} />
            <Base as="span" cx={[
                styles.backgrounds['primary'],
                styles.text["subhead"],
                styles.buttons["reversed"]
            ]} className="PillList-label">
                {props.value}
            </Base>
        </Base>
    )
}
export function WeeklyList(props) {
    const result = props.weeks
    return (
        <FlexList variant='spaceBetween'>
            {result.map((date) => {
                var startDate = date[0]
                var endDate = date[1]
                return (
                    <List as='li' key={startDate.replace(/ /g, '')}>
                        <Base as='label' className={'PillList-item'}>
                            <input id={startDate} type="checkbox" name={props.name} value={startDate} onChange={props.handleSelect} />

                            {startDate === 'Jul 01' ?
                                <Tooltip title={'40% discount! Closed 7/4 & 7/5'} placement="top">
                                    <span id={startDate + '-span'} className="PillList-label">
                                        {startDate} - {endDate}
                                    </span>
                                </Tooltip> :
                                <span id={startDate + '-span'} className="PillList-label">
                                    {startDate} - {endDate}
                                </span>
                            }
                        </Base>
                        <br />
                        <input type="checkbox" id={startDate + "-precare"} name="precare" onChange={props.handleCareType} />
                        <span>Precare</span>
                        <br />
                        <input type="checkbox" id={startDate + "-postcare"} name="postcare" onChange={props.handleCareType} />
                        <span>Postcare</span>
                    </List>
                )
            })}
        </FlexList>
    )
}
