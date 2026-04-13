import { h, h_ } from "../utils/preact";
import {
    MdDashboard,
    MdSettings,
} from 'react-icons/md';
import { Icon } from '@rsuite/icons';
import { Button } from 'rsuite';
import { layout$, SidebarType } from '../state/ui';
import { toggleN } from '../utils/bool';
import WorkspacePanel from './workspace-panel';
import "./side-nav.css"
import { FlexRowS } from './flex';
import { useAtom } from "jotai";
import { Component, VNode } from "preact";
import SettingsPanel from "./settings-panel";
import SearchPanel from "./search-panel";

export default function SideNav() {
    const [layout, setLayout] = useAtom(layout$)

    return h(FlexRowS, {
        className: `ngoblin-side-nav-container ${layout.openSidebar ? "-expanded" : ""}`
    },
        h("div", {
            className: "ngoblin-side-nav"
        },
            h(Button, {
                appearance: "subtle",
                startIcon: h(Icon, {
                    as: MdDashboard,
                }),
                onClick: () => {
                    setLayout(v => {
                        v.openSidebar = toggleN("WORKSPACE", v.openSidebar)
                    })
                }
            }),
            h(Button, {
                appearance: "subtle",
                startIcon: h(Icon, {
                    as: MdSettings,
                }),
                onClick: () => {
                    setLayout(v => {
                        v.openSidebar = toggleN("SETTINGS", v.openSidebar)
                    })
                }
            })),

        layout.openSidebar && h("div", {
            className: "ngoblin-side-nav-expanded"
        },
            h_(panels[layout.openSidebar])),
    );
}

const panels: Record<SidebarType, () => VNode<any>> = {
  WORKSPACE: WorkspacePanel,
  SETTINGS: SettingsPanel,
  SEARCH: SearchPanel
}
