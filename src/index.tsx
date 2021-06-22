import * as React from "react"
import { render } from "react-dom"
import { Renderer } from "./CanvasRenderer" 
import { parseFrdFile } from "./frdParser"
import { rs225p4 } from "./resources/rs225p4"
import { rst28f4 } from "./resources/rst28f4"
import { createGlobalStyle } from "styled-components"
import { Provider, defaultTheme, Grid, View, Header, Content }  from "@adobe/react-spectrum"


const GlobalStyles = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
  }
`

const App = () => {
  const [ framesPerSecond, setFramesPerSecond ] = React.useState(0)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  React.useEffect(() => {
    if (!canvasRef.current) {
      throw new Error('lol')
    }
    
    const bcr = canvasRef.current.getBoundingClientRect()
    canvasRef.current.width = bcr.width * 2
    canvasRef.current.height = bcr.height * 2

    const frd = [
      parseFrdFile('#ff0000', rs225p4),
      parseFrdFile('#00ff00', rst28f4),
    ]

    new Renderer(canvasRef.current, frd, setFramesPerSecond)
  })

  return <>
    <GlobalStyles />
    
    <Provider theme={defaultTheme}>
      <Grid
        areas={[
          'header  sidebar',
          'content sidebar',
          'footer  sidebar',
        ]}
        columns={['1fr', '300px']}
        rows={['size-500', 'auto', 'size-300']}
        height="100vh"
        gap="size-50"
      >
        <View backgroundColor="gray-200" gridArea="header">
          <Header>Vois Le Voix</Header>
        </View>
        <View backgroundColor="gray-75" gridArea="content">
          <canvas
            style={{ height: "100%", width: "100%" }}
            ref={canvasRef}
          />
        </View>
        <View backgroundColor="gray-200" gridArea="sidebar" />
        <View backgroundColor="gray-200" gridArea="footer">
          <Content>
            Frame time: {framesPerSecond}
          </Content>
        </View>
      </Grid>
      {/* <Button variant="cta" onPress={() => alert('Hey there!')}>
        Hello React Spectrum!
      </Button> */}
    </Provider>
  </>
}


const root = document.getElementById("root")
if (!root) { throw new Error('Root not found') }

render(<App />, root)
