import React from "react"
import Visible from "./visible"
export default ({ production, visible = true }) => {
  return (
    <Visible visible={visible}>
      <section>
        {production.map((producing) => {
          return (
            <div title={producing.name} key={producing.name}>
              <span className="name">{producing.icon}</span>{" "}
              <span className="minerals">{producing.progress}</span>{" "}
            </div>
          )
        })}{" "}
      </section>
    </Visible>
  )
}
