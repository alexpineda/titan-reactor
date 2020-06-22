
  JssuhLoader.loadReplay().then((data) => {
    const replay = ReplayGameData.fromJssuhJSON(data)
    
    const broodwarClock = new BroodwarClock(replay.durationFrames)
    broodwarClock.restart()
    const commandsByFrame = replay.commands.reduce((cmds, cmd) => {
      if (!cmds[cmd.frame]) {
        cmds[cmd.frame] = []
      }
      cmds[cmd.frame].push(cmd)
      return cmds
    }, {})

    

  })
  
  