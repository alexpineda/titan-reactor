import React from "react"
import Visible from "./visible"

export default ({ selected, visible = true }) => {
  return (
    <Visible visible={visible}>
      <section>
        {selected.map((selection) => {
          return <p key={selection.id}>Selected</p>
        })}
      </section>
    </Visible>
  )
}
