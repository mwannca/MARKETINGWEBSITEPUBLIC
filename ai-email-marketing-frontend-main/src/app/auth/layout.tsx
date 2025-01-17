import Image from 'next/image'
import React from 'react'
import Link from 'next/link'

export default function Auth_layout( { children } :
                                         Readonly<{
                                             children: React.ReactNode
                                         }> ) {
    return (
        <div className=' min-h-screen flex flex-col items-center'>
            <div className=' fixed top-0'>
                <div className=' flex items-center gap-1 text-xl font-semibold mt-2'>
                    <Link href="/" passHref>
                        <Image
                            alt='logo'
                            src={'/IMG_8769-removebg-preview (1).png'}
                            width={40}
                            height={40}
                            style={{cursor: 'pointer'}} // Optional: Change cursor to pointer
                        />
                    </Link>
                    <h1>MailSpark</h1>

                </div>
            </div>
            {children}
        </div>
    )
}
