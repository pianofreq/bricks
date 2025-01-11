import type { NextPage } from 'next'
import ImageUpload from '../components/image-upload'
import React from 'react'


const Home: NextPage = () => {
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Image Descriptor
      </h1>
      <div className="mx-auto max-w-3xl">
        <ImageUpload />
      </div>
    </main>
  )
}

export default Home