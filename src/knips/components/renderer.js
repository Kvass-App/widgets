import { Image, Button } from '@kvass/ui'

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
  if (!block.spans?.length) return block.text

  let result = block.spans.flatMap((span) => RenderSpan(span, block))
  //merge strings together to prevent comma splits
  if (
    result instanceof Array &&
    (result || [])?.every((i) => typeof i === 'string')
  )
    result = [result.join(' ')]
  return result
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
  h1: (block) => ({ component: 'h1', content: RenderSpans(block) }),
  h2: (block) => ({ component: 'h2', content: RenderSpans(block) }),
  regular: (block) => ({ component: 'p', content: RenderSpans(block) }),
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
    }
  },
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
}

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

const ValidateBlocks = (item) => {
  return item.blocks.every((block) => block.type in Blocks)
}

export { RenderBlock, getTitle, getThumbnail, ValidateBlocks }
