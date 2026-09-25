import parse from 'html-react-parser'

type Props = {
  children: string
  className?: string
}

export function Html({ children, className }: Props) {
  const html = children.replaceAll('<br/>', '')

  return <span className={className}>{parse(html)}</span>
}
