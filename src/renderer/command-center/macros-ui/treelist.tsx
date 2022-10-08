import { MacroDTO } from "common/types";
import groupBy from "lodash.groupby";
import React from "react";
import { MathUtils } from "three";

function TreeListFolderLabel({
  name,
  onClick,
}: {
  name: string;
  onClick: () => void;
}) {
  return (
    <span style={{ cursor: "pointer" }} onClick={onClick}>
      <i
        className="material-icons"
        style={{
          fontSize: "var(--font-size-3)",
          marginRight: "var(--size-1)",
        }}
      >
        folder
      </i>
      <span>{name}</span>
    </span>
  );
}

function TreeListNodeChildren({
  node,
  selected,
  onSelect,
}: {
  node: MacroTreeNode;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <ul>
      {node.children.map((child) =>
        isMacroTreeNode(child) ? (
          <TreeListNode
            key={child.folderId}
            node={child}
            selected={selected}
            onSelect={onSelect}
          />
        ) : (
          <li
            key={child.id}
            style={{
              color: child.id === selected ? "var(--blue-5)" : "var(--gray-8)",
              cursor: "pointer",
            }}
            onClick={(evt) => {
              evt.stopPropagation();
              onSelect(child.id);
            }}
          >
            {child.name.split(":").slice(-1)}
          </li>
        )
      )}
    </ul>
  );
}

function TreeListNode({
  node,
  selected,
  onSelect,
}: {
  node: MacroTreeNode;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div
      key={node.name}
      style={{
        margin: "var(--size-1)",
      }}
    >
      <div
        style={{
          color: "var(--gray-6)",
        }}
      >
        <TreeListFolderLabel
          name={node.name}
          onClick={() => setCollapsed(!collapsed)}
        />
        {!collapsed && (
          <TreeListNodeChildren
            node={node}
            selected={selected}
            onSelect={onSelect}
          />
        )}
      </div>
    </div>
  );
}

export type MacroTreeNode = {
  folderId: string;
  name: string;
  children: (MacroTreeNode | MacroDTO)[];
};

export function TreeList({
  macros,
  selected,
  onSelect,
}: {
  macros: MacroDTO[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const root = groupMacros(macros);

  return (
    <TreeListNodeChildren node={root} selected={selected} onSelect={onSelect} />
  );
}

const isMacroTreeNode = (
  x: MacroTreeNode | MacroDTO | undefined
): x is MacroTreeNode => x !== undefined && "children" in x;

const getNode = (node: MacroTreeNode, path: string[]): MacroTreeNode => {
  const [head, ...tail] = path;

  const child = node.children.find((x) => x.name === head);

  if (isMacroTreeNode(child)) {
    if (tail.length === 0) {
      return child;
    }
    return getNode(child, tail);
  } else {
    const newChild = {
      name: head,
      children: [],
      folderId: MathUtils.generateUUID(),
    };
    node.children.push(newChild);
    if (tail.length === 0) {
      return newChild;
    }
    return getNode(newChild, tail);
  }
};

const groupMacros = (macros: MacroDTO[]) => {
  return Object.values(groupBy(macros, (x) => x.name.split(":").length)).reduce(
    (acc, macros) => {
      for (const macro of macros) {
        const folders = macro.name
          .split(":")
          .slice(0, -1)
          .map((x) => x.trim());

        if (folders.length === 0) {
          acc.children.push(macro);
          continue;
        }

        const parent = getNode(acc, folders);
        parent.children.push(macro);
      }

      return acc;
    },
    {
      name: "Macros",
      children: [],
      folderId: MathUtils.generateUUID(),
    } as MacroTreeNode
  );
};
