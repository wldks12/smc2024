import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <a href="https://smc.sen.hs.kr" target="_blank" rel="noopener noreferrer">
          세명컴고
        </a>
        <span className="ms-1">&copy; 2024 인공과.</span>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
