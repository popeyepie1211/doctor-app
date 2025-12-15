import React from 'react'

const VideoCallPage = async ({ searchParams }) => {
    const {sessionId,token } = searchParams;
  return <VideoCall sessionId={sessionId} token={token} />
}

export default VideoCallPage