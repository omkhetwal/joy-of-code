import fs from 'fs'
import path from 'path'

// MDX sauce
import matter from 'gray-matter'
import hydrate from 'next-mdx-remote/hydrate'
import renderToString from 'next-mdx-remote/render-to-string'

// MDX plugins
import rehypePrism from '@mapbox/rehype-prism'
import codeTitle from 'remark-code-titles'
import unwrapImages from 'remark-unwrap-images'

import { Post } from '@/root/components/screens/Post'
import { MDXComponents } from '@/root/components/ui/MDXComponents'
import { postsPath, postFilePaths } from '@/root/utils/helpers/posts'

interface Post {
  MDXSource: {
    compiledSource: string
    renderedOutput: string
    scope?: unknown
  }
  frontMatter: {
    title: string
    description: string
    image: string
  }
}

interface Params {
  params: {
    slug: string
  }
}

export default function PostPage({ MDXSource, frontMatter }: Post) {
  const content = hydrate(MDXSource, { components: MDXComponents })

  return <Post content={content} frontMatter={frontMatter} />
}

// generate paths at build-time
export async function getStaticPaths() {
  const paths = postFilePaths
    .map((path) => path.replace(/\.mdx?$/, ''))
    .map((slug) => ({ params: { slug } }))

  return {
    paths,
    fallback: false,
  }
}

// grab and process MDX post by the slug "posts/[slug]"
export async function getStaticProps({ params }: Params) {
  const postFilePath = path.join(postsPath, `${params?.slug}.mdx`)
  const source = fs.readFileSync(postFilePath)

  const { content, data } = matter(source)

  const MDXSource = await renderToString(content, {
    components: MDXComponents,
    mdxOptions: {
      rehypePlugins: [rehypePrism],
      remarkPlugins: [codeTitle, unwrapImages],
    },
  })

  return {
    props: {
      MDXSource,
      frontMatter: data,
    },
  }
}
