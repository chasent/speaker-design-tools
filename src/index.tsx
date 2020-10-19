import * as React from "react"
import { render } from "react-dom"
import { Renderer } from "./omp"
import { DataClass } from "./DataClass"
import { parseFrdFile } from "./frdParser"
import { testFrdString } from "./test"
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

    const frd = parseFrdFile('', testFrdString)

    new Renderer(canvasRef.current, new DataClass(frd), setFramesPerSecond)
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
