"use client";

import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

type ChatMarkdownProps = {
  content: string;
};

export function ChatMarkdown({
  content,
}: ChatMarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSanitize]}
      components={{
        h1({
          children,
          ...props
        }: ComponentPropsWithoutRef<"h1">) {
          return (
            <h1
              className="mb-3 mt-5 text-xl font-bold first:mt-0"
              {...props}
            >
              {children}
            </h1>
          );
        },

        h2({
          children,
          ...props
        }: ComponentPropsWithoutRef<"h2">) {
          return (
            <h2
              className="mb-2 mt-5 text-lg font-semibold first:mt-0"
              {...props}
            >
              {children}
            </h2>
          );
        },

        h3({
          children,
          ...props
        }: ComponentPropsWithoutRef<"h3">) {
          return (
            <h3
              className="mb-2 mt-4 text-base font-semibold first:mt-0"
              {...props}
            >
              {children}
            </h3>
          );
        },

        p({
          children,
          ...props
        }: ComponentPropsWithoutRef<"p">) {
          return (
            <p
              className="mb-3 leading-7 last:mb-0"
              {...props}
            >
              {children}
            </p>
          );
        },

        strong({
          children,
          ...props
        }: ComponentPropsWithoutRef<"strong">) {
          return (
            <strong
              className="font-semibold"
              {...props}
            >
              {children}
            </strong>
          );
        },

        em({
          children,
          ...props
        }: ComponentPropsWithoutRef<"em">) {
          return (
            <em className="italic" {...props}>
              {children}
            </em>
          );
        },

        ul({
          children,
          ...props
        }: ComponentPropsWithoutRef<"ul">) {
          return (
            <ul
              className="mb-3 ml-5 list-disc space-y-1 last:mb-0"
              {...props}
            >
              {children}
            </ul>
          );
        },

        ol({
          children,
          ...props
        }: ComponentPropsWithoutRef<"ol">) {
          return (
            <ol
              className="mb-3 ml-5 list-decimal space-y-1 last:mb-0"
              {...props}
            >
              {children}
            </ol>
          );
        },

        li({
          children,
          ...props
        }: ComponentPropsWithoutRef<"li">) {
          return (
            <li
              className="pl-1 leading-7"
              {...props}
            >
              {children}
            </li>
          );
        },

        blockquote({
          children,
          ...props
        }: ComponentPropsWithoutRef<"blockquote">) {
          return (
            <blockquote
              className="my-3 border-l-4 border-primary/40 bg-background/70 px-4 py-2 italic text-muted-foreground"
              {...props}
            >
              {children}
            </blockquote>
          );
        },

        hr(
          props: ComponentPropsWithoutRef<"hr">,
        ) {
          return (
            <hr
              className="my-5 border-border"
              {...props}
            />
          );
        },

        a({
          children,
          href,
          ...props
        }: ComponentPropsWithoutRef<"a">) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4 hover:opacity-80"
              {...props}
            >
              {children}
            </a>
          );
        },

        table({
          children,
          ...props
        }: ComponentPropsWithoutRef<"table">) {
          return (
            <div className="my-4 max-w-full overflow-x-auto rounded-lg border">
              <table
                className="w-full border-collapse text-left text-sm"
                {...props}
              >
                {children}
              </table>
            </div>
          );
        },

        thead({
          children,
          ...props
        }: ComponentPropsWithoutRef<"thead">) {
          return (
            <thead
              className="bg-background/80"
              {...props}
            >
              {children}
            </thead>
          );
        },

        tbody({
          children,
          ...props
        }: ComponentPropsWithoutRef<"tbody">) {
          return (
            <tbody
              className="divide-y divide-border"
              {...props}
            >
              {children}
            </tbody>
          );
        },

        tr({
          children,
          ...props
        }: ComponentPropsWithoutRef<"tr">) {
          return (
            <tr
              className="transition-colors hover:bg-background/50"
              {...props}
            >
              {children}
            </tr>
          );
        },

        th({
          children,
          ...props
        }: ComponentPropsWithoutRef<"th">) {
          return (
            <th
              className="border-b px-3 py-2 font-semibold"
              {...props}
            >
              {children}
            </th>
          );
        },

        td({
          children,
          ...props
        }: ComponentPropsWithoutRef<"td">) {
          return (
            <td
              className="px-3 py-2 align-top"
              {...props}
            >
              {children}
            </td>
          );
        },

        pre({
          children,
          ...props
        }: ComponentPropsWithoutRef<"pre">) {
          return (
            <pre
              className="my-4 max-w-full overflow-x-auto rounded-lg bg-zinc-950 p-4 text-sm leading-6 text-zinc-100"
              {...props}
            >
              {children}
            </pre>
          );
        },

        code({
          children,
          className,
          ...props
        }: ComponentPropsWithoutRef<"code">) {
          const isCodeBlock =
            typeof className === "string" &&
            className.includes("language-");

          if (isCodeBlock) {
            return (
              <code
                className={className}
                {...props}
              >
                {children}
              </code>
            );
          }

          return (
            <code
              className="rounded bg-background/80 px-1.5 py-0.5 font-mono text-[0.9em]"
              {...props}
            >
              {children}
            </code>
          );
        },

        input({
          type,
          checked,
          ...props
        }: ComponentPropsWithoutRef<"input">) {
          if (type === "checkbox") {
            return (
              <input
                type="checkbox"
                checked={checked}
                readOnly
                className="mr-2 size-4 align-middle"
                {...props}
              />
            );
          }

          return (
            <input
              type={type}
              {...props}
            />
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}