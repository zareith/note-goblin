import { h, h_ } from "../utils/preact";
import { useState } from "preact/hooks";
import { Toggle, Panel, FlexboxGrid } from "rsuite";
import { Icon } from "@rsuite/icons";
import { MdLightMode, MdDarkMode } from "react-icons/md";

export default function SettingsPanel() {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  return h("div", {
    style: {
      padding: "16px",
      width: "100%"
    }
  },
    h(Panel, {
      header: "Theme Settings",
      bordered: true,
      style: {
        marginBottom: "16px"
      }
    },
      h(FlexboxGrid, {
        align: "middle",
        style: {
          padding: "8px 0"
        }
      },
        h(FlexboxGrid.Item, {
          colspan: 4
        },
          h(Icon, {
            as: isDarkTheme ? MdDarkMode : MdLightMode,
            size: "lg",
            style: {
              marginRight: "8px"
            }
          })),
        h(FlexboxGrid.Item, {
          colspan: 12
        },
          h("span", {
            style: {
              fontSize: "14px",
              fontWeight: "500"
            }
          }, isDarkTheme ? "Dark Theme" : "Light Theme")),
        h(FlexboxGrid.Item, {
          colspan: 8
        },
          h(Toggle, {
            checked: isDarkTheme,
            onChange: (checked: boolean) => {
              setIsDarkTheme(checked);
              // Theme switching logic will be added here later
            },
            size: "md"
          })))));
}
