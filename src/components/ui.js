import { Link as GatsbyLink } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"
import isAbsoluteURL from "is-absolute-url"
import * as React from "react"
import * as styles from "./ui.css"
import "../styles/pillbox.css"

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

export function Kicker({ ...props }) {
    return <Text variant="kicker" {...props} />
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

export function NavLink({ ...props }) {
    return <Base as={Link} cx={[styles.navlink]} {...props} />
}

export function NavButtonLink({ ...props }) {
    return <Base as="button" cx={[styles.navButtonlink]} {...props} />
}

export function Button({ variant = "primary", ...props }) {
    return <Base as={Link} cx={[styles.buttons[variant]]} {...props} />
}

export function ButtonList({ links = [{ id: "homeid", href: '/', text: 'Home' }], reversed = false, ...props }) {
    const getVariant = (i) => {
        if (reversed) {
            return i === 0 ? "reversed" : "linkReversed"
        }
        return i === 0 ? "primary" : "link"
    }
    return (
        <FlexList marginY={4} {...props}>
            {links &&
                links.map((link, i) => (
                    <li key={link.id}>
                        <Button href={link.href} variant={getVariant(i)}>
                            {link.text}
                        </Button>
                    </li>
                ))}
        </FlexList>
    )
}

export function CTALink(props) {
    return <Base as={Link} cx={[styles.ctaLink]} {...props} />
}

export function LinkList({ links = [], ...props }) {
    return (
        <FlexList {...props}>
            {links &&
                links.map((link, i) => (
                    <li key={link.id}>
                        <CTALink href={link.href}>{link.text}</CTALink>
                    </li>
                ))}
        </FlexList>
    )
}

export function Blockquote(props) {
    return <Base as="blockquote" cx={[styles.blockquote]} {...props} />
}

export function Avatar({ alt, image }) {
    return (
        <GatsbyImage alt={alt} image={getImage(image)} className={styles.avatar} />
    )
}

export function Logo({ alt, image, size = "small" }) {
    return (
        <GatsbyImage
            alt={alt}
            image={getImage(image)}
            className={styles.logos[size]}
        />
    )
}

export function Icon({ alt, image, size = "medium" }) {
    return (
        <GatsbyImage
            alt={alt}
            image={getImage(image)}
            className={styles.icons[size]}
        />
    )
}

export function IconLink(props) {
    return <NavLink cx={[styles.iconLink]} {...props} />
}

export function InteractiveIcon(props) {
    return <Base as="button" cx={[styles.interactiveIcon]} {...props} />
}

export function VisuallyHidden(props) {
    return <Base as="span" cx={[styles.visuallyHidden]} {...props} />
}

export function BlockLink(props) {
    return <Link className={styles.blockLink} {...props} />
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
    var start = props.startDate
    var end = new Date(props.endDate)
    var result = [];
    // Copy start date
    var current = new Date(start);
    // While less than end date, add dates to result array
    while (current <= end) {
        var temp = new Date(current)
        current.setDate(current.getDate() + 7);
        result.push([temp, new Date(current - 1)]);
    }
    result.pop()
    return (
        <FlexList variant='spaceBetween'>
            {result.map((date) => {
                var startDate = date[0].toString().substring(4, 10)
                var endDate = date[1].toString().substring(4, 10)
                return (
                    <Base as='li' key={startDate.replace(/ /g, '')}>
                        <Base as='label' className={'PillList-item'}>
                            <input id={startDate} type="checkbox" name={props.name} value={startDate} onChange={props.handleSelect} />
                            <span className="PillList-label">
                                {startDate} - {endDate}
                            </span>
                        </Base>
                        <br />
                        <input type="checkbox" id={startDate + "-precare"} name="precare" onChange={props.handlePrePostCare} />
                        <span>Pre-care 8-9am $50</span>
                        <br />
                        <input type="checkbox" id={startDate + "-postcare"} name="postcare" onChange={props.handlePrePostCare} />
                        <span>Post-care 3-5:30pm $100</span>
                    </Base>
                )
            })}
        </FlexList>
    )
}
