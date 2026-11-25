import { h } from 'vue'
import { Image, Button } from '@kvass/ui'

const TextAlign = (block) =>
  block.alignment ? { textAlign: block.alignment } : undefined

const LineBreaks = (value) =>
  typeof value === 'string' ? value.replace(/\n/g, '<br>') : value

const SpanStyles = {
  bold: (span) => `<b>${span.text}</b>`,
  italic: (span) => `<i>${span.text}</i>`,
  underline: (span) => `<u>${span.text}</u>`,
  link: (span, block) => {
    const target = block.inlineLinks[span.linkId]
    return `<a href="${target.url}" target="_blank">${span.text}</a>`
  },
}

const RenderSpans = (block) => {
  if (!block.spans?.length) return LineBreaks(block.text)

  let result = block.spans.flatMap((span) => RenderSpan(span, block))
  //merge strings together to prevent comma splits
  if (
    result instanceof Array &&
    (result || [])?.every((i) => typeof i === 'string')
  )
    result = [result.join(' ')]
  return result.map(LineBreaks)
}

const RenderSpan = (span, block) => {
  return span.styles.reduce((content, style) => {
    if (!(style in SpanStyles)) {
      console.error('Knips unsupportet style:', style)
      return content
    }
    return SpanStyles[style](span, block)
  }, span.text)
}

const Blocks = {
  h1: (block) => ({
    component: 'h1',
    content: RenderSpans(block),
    style: TextAlign(block),
  }),
  h2: (block) => ({
    component: 'h2',
    content: RenderSpans(block),
    style: TextAlign(block),
  }),
  regular: (block) => ({
    component: 'p',
    content: RenderSpans(block),
    style: TextAlign(block),
  }),
  quote: (block) => ({
    component: 'blockquote',
    content: RenderSpans(block),
    props: { alignment: block.alignment },
  }),
  divider: () => ({ component: 'hr' }),
  image: (block, item) => {
    if (block.imageUrl === item.featuredImage?.src) return
    return {
      component: Image,
      src: block.imageUrl,
      size: 'contain',
      'aspect-ratio': block.imageRatio,
      style: block.looks?.maxWidth
        ? { maxWidth: `${block.looks.maxWidth}px`, marginInline: 'auto' }
        : undefined,
    }
  },
  columns: (block, item) => ({
    component: 'div',
    'data-stacked': block.stackedOnMobile === false ? undefined : '',
    'data-align': block.verticalAlignment,
    children: (block.blocks || []).map((column) => ({
      component: 'div',
      'data-block-type': 'column',
      style: { flex: column.flex || 1 },
      children: RenderBlocks(column.blocks, item),
    })),
  }),
  video: (block, item) => {
    if (block.imageUrl === item.featuredImage?.src) return
    return {
      component: 'video',
      type: 'video/mp4',
      controls: true,
      src: block.videoStorageUrl,
      style: {
        'aspect-ratio': block.imageRatio,
      },
    }
  },
  list: (block) => {
    return {
      component: 'ul',
      content: block.spans
        .map((span) => `<li>${RenderSpan(span, block)}</li>`)
        .join(''),
    }
  },
  link: (block) => {
    return {
      component: block.style === 'button' ? Button : 'a',
      [block.style === 'button' ? 'label' : 'content']: block.text,
      variant: 'secondary',
      is: 'a',
      href: block.urlRedirect || block.url,
      target: '_blank',
    }
  },
  mediaCarousel: (block) => {
    const media = (block.mediaList || []).filter((m) => m.imageUrl)
    if (!media.length) return
    return {
      component: 'div',
      content: media
        .map(
          (m) =>
            `<figure style="aspect-ratio: ${Number(m.imageRatio) || 16 / 9}"><img src="${EscapeAttr(m.imageUrl)}" alt="${EscapeAttr(m.altText || '')}" loading="lazy" /></figure>`,
        )
        .join(''),
    }
  },
}

const EscapeAttr = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

const RenderBlock = (block, item, meta) => {
  if (!(block.type in Blocks)) {
    console.error('Knips unsupportet block:', block.type)
    return
  }
  return {
    ...Blocks[block.type](block, item, meta),
    'data-block-type': block.type,
  }
}

const RenderBlocks = (blocks, item) =>
  (blocks || []).map((block) => RenderBlock(block, item)).filter(Boolean)

// renders rendered blocks recursively, so columns can hold their own blocks
const BlockList = (props) =>
  (props.blocks || []).map(({ component, content, children, ...rest }) => {
    const inner = children
      ? h(BlockList, { blocks: children })
      : content
        ? h('span', { innerHTML: content })
        : undefined
    if (!inner) return h(component, rest)
    return typeof component === 'string'
      ? h(component, rest, [inner])
      : h(component, rest, { default: () => inner })
  })
BlockList.props = ['blocks']

const getTitle = (item) =>
  item.blocks.find((b) => ['h1', 'h2'].includes(b.type))?.text

const getThumbnail = (item) => {
  if (item.featuredImage.type === 'video')
    return {
      component: 'video',
      props: {
        src: item.blocks.find(
          (b) => b.type === 'video' && b.imageUrl === item.featuredImage.src,
        )?.videoStorageUrl,
        autoplay: true,
        type: 'video/mp4',
      },
    }

  return {
    component: Image,
    props: { src: item.featuredImage.src, 'aspect-ratio': '16/9' },
  }
}

const isSupportedBlock = (block) => {
  if (!(block.type in Blocks)) return false
  if (block.type !== 'columns') return true
  return (block.blocks || []).every((column) =>
    (column.blocks || []).every(isSupportedBlock),
  )
}

const ValidateBlocks = (item) => item.blocks.every(isSupportedBlock)

// Knips wraps content in sections (role: header | body | footer).
// Header (logo) and footer (newsletter unsubscribe etc.) are email-specific,
// so only the body content is used. Posts without sections are returned as-is.
const SkippedSectionRoles = ['header', 'footer']

const FlattenBlocks = (blocks = []) =>
  (blocks || []).flatMap((block) => {
    if (block.type !== 'section') return [block]
    if (SkippedSectionRoles.includes(block.role)) return []
    return FlattenBlocks(block.blocks)
  })

export {
  RenderBlock,
  RenderBlocks,
  BlockList,
  getTitle,
  getThumbnail,
  ValidateBlocks,
  FlattenBlocks,
}
