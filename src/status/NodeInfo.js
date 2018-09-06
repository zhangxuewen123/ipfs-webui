import React from 'react'
import { connect } from 'redux-bundler-react'
import { translate } from 'react-i18next'
import Speedometer from './Speedometer'
import Box from '../components/box/Box'
import { Title } from './Commons'
import 'details-polyfill'

const Block = ({ children }) => (
  <div className='dt dt--fixed pt2'>
    { children }
  </div>
)

const Label = ({ children }) => (
  <label className='dtc silver tracked ttu f7' style={{ width: '100px' }}>{children}</label>
)

const Value = ({ children, advanced = false }) => (
  <div className={`dtc charcoal monospace ${advanced ? 'word-wrap f7 lh-copy pa2 bg-light-gray' : 'truncate'}`}>{children}</div>
)

const Graph = (props) => (
  <div className='mr2 ml2 mt3 mt0-l'>
    <Speedometer {...props} />
  </div>
)

class NodeInfo extends React.Component {
  state = {
    downSpeed: {
      filled: 0,
      total: 125000 // Starts with 1 Mb/s max
    },
    upSpeed: {
      filled: 0,
      total: 125000 // Starts with 1 Mb/s max
    }
  }

  componentDidUpdate (_, prevState) {
    const { stats } = this.props

    const down = stats ? parseInt(stats.bw.rateIn.toFixed(0), 10) : 0
    const up = stats ? parseInt(stats.bw.rateOut.toFixed(0), 10) : 0

    if (down !== prevState.downSpeed.filled || up !== prevState.upSpeed.filled) {
      this.setState({
        downSpeed: {
          filled: down,
          total: Math.max(down, prevState.downSpeed.total)
        },
        upSpeed: {
          filled: up,
          total: Math.max(up, prevState.upSpeed.total)
        }
      })
    }
  }

  getField (obj, field, fn) {
    if (obj && obj[field]) {
      if (fn) {
        return fn(obj[field])
      }

      return obj[field]
    }

    return 'Cannot access the API.'
  }

  render () {
    const { t, ipfsIdentity, stats, peers } = this.props
    const { downSpeed, upSpeed } = this.state

    let addresses = null

    if (ipfsIdentity) {
      addresses = [...new Set(ipfsIdentity.addresses)].map(addr => <div key={addr}>{addr}</div>)
    }

    return (
      <Box className='f6 pa4'>
        <div className='flex flex-column flex-row-l flex-wrap-l justify-between-l'>
          <div className='w-100 w-50-l pr2-l' style={{ maxWidth: '34em' }} >
            <Title style={{ marginBottom: '0.5rem' }}>{t('nodeInfo')}</Title>
            <Block>
              <Label>{t('cid')}</Label>
              <Value>{this.getField(ipfsIdentity, 'id')}</Value>
            </Block>
            <Block>
              <Label>{t('peers')}</Label>
              <Value>{peers ? peers.length : 0}</Value>
            </Block>
            <Block>
              <Label>{t('version')}</Label>
              <Value>{this.getField(ipfsIdentity, 'agentVersion')}</Value>
            </Block>
          </div>
          <div className='w-100 pl2-l flex-wrap flex-no-wrap-l flex justify-between' style={{ maxWidth: '35rem' }}>
            <Graph
              title={t('upSpeed')}
              color='#69c4cd'
              {...upSpeed} />
            <Graph
              title={t('downSpeed')}
              color='#f39021'
              {...downSpeed} />
            <Graph
              title={t('spaceUsed')}
              color='#0b3a53'
              noSpeed
              filled={stats ? parseInt(stats.repo.repoSize.toFixed(0), 10) : 0}
              total={stats ? parseInt(stats.repo.storageMax.toFixed(0), 10) : 0} />
          </div>
        </div>

        <details className='mt3'>
          <summary className='pointer blue outline-0'>{t('advanced')}</summary>
          <div className='mt3'>
            <Block>
              <Label>{t('publicKey')}</Label>
              <Value advanced>{this.getField(ipfsIdentity, 'publicKey')}</Value>
            </Block>
            <Block>
              <Label>{t('addresses')}</Label>
              <Value advanced>{addresses}</Value>
            </Block>
          </div>
        </details>
      </Box>
    )
  }
}

export default connect(
  'selectIpfsIdentity',
  'selectPeers',
  'selectStats',
  translate('status')(NodeInfo)
)