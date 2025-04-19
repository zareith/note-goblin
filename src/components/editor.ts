import "../styles/toast-editor.css";
import { RiHeading, RiBold, RiItalic, RiStrikethrough, RiQuoteText, RiListView, RiListOrdered, RiListUnordered } from "react-icons/ri";
import { GoTasklist } from "react-icons/go";
import CodeMirror, { ReactCodeMirrorProps, ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { markdown } from "@codemirror/lang-markdown"
import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import * as fileActions from "../actions/files";
import * as fileAtoms from "../state/files";
import "./editor.css"
import { h, h_ } from "../utils/preact";
import { useAtomValue } from "jotai";
import {
    Table,
    TaskList,
    Strikethrough,
    Subscript,
    Superscript,
    Emoji,
} from "@lezer/markdown"
import { papyrusLight } from "../utils/codemirror/themes/papyrus-light";
import { imagesExtension } from "../utils/codemirror/image-preview";
import { VNode } from "preact";
import { ButtonToolbar, Dropdown, IconButton, Popover, Whisper } from "rsuite";

const extensions = [
    papyrusLight,
    imagesExtension(),
    markdown({
        extensions: [
            Table,
            TaskList,
            Strikethrough,
            Subscript,
            Superscript,
            Emoji,
            // MacroExtension,
        ],
    })
];

interface InjectionOpts {
    ensureStart?: boolean
}

interface ToolbarItem {
    key: string
    icon?: VNode
    label?: string
    onClick?: () => void
    children?: ToolbarItem[]
}

export default function Editor() {
    const curFile = useAtomValue(fileAtoms.currentFile$)
    const containerRef = useRef<HTMLDivElement | null>(null)
    const editorRef = useRef<Instance | null>(null)
    const openFiles = useAtomValue(fileAtoms.openFiles$)
    const codemirrorRef = useRef<ReactCodeMirrorRef>(null)

    const onChange = useCallback((value: string) => {
        if (!curFile) return;
        fileActions.updateFile(curFile.path, value);
    }, [curFile?.path])

    const toolbarButtons = useMemo((): ToolbarItem[] => [
        {
            icon: h_(RiHeading),
            label: "Heading",
            key: "heading",
            children: [
                {
                    key: "h1",
                    label: "Heading 1",
                    onClick: () => injectOrWrap("# ", "", { ensureStart: true }),
                },
                {
                    key: "h2",
                    label: "Heading 2",
                    onClick: () => injectOrWrap("## ", "", { ensureStart: true }),
                },
                {
                    key: "h3",
                    label: "Heading 3",
                    onClick: () => injectOrWrap("### ", "", { ensureStart: true }),
                },
                {
                    key: "h4",
                    label: "Heading 4",
                    onClick: () => injectOrWrap("#### ", "", { ensureStart: true }),
                },
                {
                    key: "h5",
                    label: "Heading 5",
                    onClick: () =>
                        injectOrWrap("##### ", "", { ensureStart: true }),
                },
                {
                    key: "h6",
                    label: "Heading 6",
                    onClick: () =>
                        injectOrWrap("###### ", "", { ensureStart: true }),
                },
            ],
        },
        {
            key: "bold",
            icon: h_(RiBold),
            label: "Bold",
            onClick: () => injectOrWrap("**")
        },
        {
            key: "italic",
            icon: h_(RiItalic),
            label: "Italics",
            onClick: () => injectOrWrap("*")
        },
        {
            key: "strikethrough",
            icon: h_(RiStrikethrough),
            label: "StrikeThrough",
            onClick: () => injectOrWrap("~~"),
        },
        {
            key: "quote",
            icon: h_(RiQuoteText),
            label: "block quote",
            onClick: () => injectText("> ", { ensureStart: true }),
        },
        {
            key: "ul",
            icon: h_(RiListUnordered),
            label: "Unordered List",
            onClick: () => injectText("-", { ensureStart: true }),
        },
        {
            key: "li",
            icon: h_(RiListOrdered),
            label: "Ordered List",
            onClick: () => injectText("1.", { ensureStart: true }),
        },
        {
            key: "tasks",
            icon: h_(GoTasklist),
            label: "Task List",
            onClick: () => injectText("- [ ] "),
        },
    ], []);

    useEffect(() => {
        const expectedPath = curFile?.path
        if (!expectedPath) {
            let nextPath = openFiles[0]?.path
            if (!nextPath) nextPath = fileActions.openNewFile()
            fileActions.switchFile(nextPath)
        }
    }, [curFile?.path])

    const injectText = (text: string, opts?: InjectionOpts) => {
        const view = codemirrorRef?.current?.view
        if (!view) return
        const rangeIdx = view.state.selection.mainIndex
        const mainRange = view.state.selection.ranges[rangeIdx]
        if (!mainRange) return
        if (opts?.ensureStart) {
            const line = view.state.doc.lineAt(mainRange.from)
            if (line.from !== mainRange.from) {
                text = `\n${text}`
            }
        }
        view.dispatch({
            changes: {
                from: mainRange.from,
                insert: text,
            },
        })
    }

    const injectOrWrap = (before: string, after = before, opts?: InjectionOpts) => {
        const view = codemirrorRef?.current?.view
        if (!view) return
        let rangeIdx = view.state.selection.mainIndex
        let mainRange = view.state.selection.ranges[rangeIdx]
        if (!mainRange) return
        if (opts?.ensureStart) {
            const line = view.state.doc.lineAt(mainRange.from)
            if (line.from !== mainRange.from) {
                before = `\n${before}`
            }
        }
        view.dispatch({
            changes: mainRange.empty
                ? {
                    from: mainRange.from,
                    insert: `${before}Update this text${after}`,
                }
                : [
                    {
                        from: mainRange.from,
                        insert: before,
                    },
                    {
                        from: mainRange.to,
                        insert: after,
                    },
                ],
        })
        // rangeIdx = view.state.selection.mainIndex
        // mainRange = view.state.selection.ranges[rangeIdx]
        // if (!mainRange) return
        // view.update([
        //     view.state.update({
        //         changes: {
        //             from: mainRange.to,
        //             insert: after
        //         }
        //     })
        // ])
    }


    if (!curFile) return null;

    const handleContainerClick = (e: MouseEvent) => {
        if ((e.target as HTMLElement)?.closest?.(".cm-panels")) return;
        editorRef.current?.focus();
    }

    return h("div", {
        className: "ngoblin-editor-container",
        tabIndex: -1,
        onClick: handleContainerClick,
        ref: containerRef,
    },
        h("div", {
            className: "ngoblin-editor-inner"
        },
            h(CodeMirror, {
                ref: codemirrorRef as any, // Issue with third-party typings
                value: curFile.wipContent,
                height: "100%",
                maxHeight: "100%",
                autoFocus: true,
                theme: "light",
                onChange,
                extensions,
                basicSetup: {
                    lineNumbers: false,
                    foldGutter: false
                }
            })),

        h("div", {
            className: "ngoblin-editor-toolbar-container",
        },
            h_(ButtonToolbar, ...toolbarButtons.map(tb => {
                const btn = h(IconButton, {
                    key: tb.key,
                    appearance: "subtle",
                    icon: tb.icon,
                    onClick: tb.onClick,
                    size: "sm"
                })
                if (!tb.children) return btn
                const menu = tb.children.map(tb =>
                    h(Dropdown.Item, {
                        key: tb.key,
                        eventKey: tb.key,
                        onClick: tb.onClick
                    }, tb.label)
                )
                return h(Whisper, {
                    placement: "bottomStart",
                    trigger: "click",
                    speaker: h(Popover, {
                        full: true
                    },
                        h_(Dropdown.Menu, ...menu)
                    ) as VNode<{}>,
                    children: btn
                })
            })))
    );
}
