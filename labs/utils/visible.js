import React from "react"

export default ({ visible, children }) => {
  return (visible && <>{children}</>) || null
}
