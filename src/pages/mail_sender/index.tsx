import { GetServerSideProps, NextPage } from 'next'
import { Card, Form, InputGroup } from 'react-bootstrap'
import axios from 'axios'
import React, { SyntheticEvent, useState } from 'react'
import { AdminLayout } from '@layout'
import { Pokemon } from '@models/pokemon'
import { newResource, Resource } from '@models/resource'
import { Pagination } from '@components/Pagination'
import { PokemonList } from '@components/Pokemon'
import { transformResponseWrapper, useSWRAxios } from '@hooks'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock, faUser } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/router'
import { deleteCookie, getCookie } from 'cookies-next'

type Props = {
  pokemonResource: Resource<Pokemon>;
  page: number;
  perPage: number;
  sort: string;
  order: string;
}

const Pokemons: NextPage<Props> = (props) => {
  const {
    pokemonResource, page, perPage, sort, order,
  } = props

  const pokemonListURL = `${process.env.NEXT_PUBLIC_POKEMON_LIST_API_BASE_URL}pokemons` || ''

  // swr: data -> axios: data -> resource: data
  const { data: { data: resource } } = useSWRAxios<Resource<Pokemon>>({
    url: pokemonListURL,
    params: {
      _page: page,
      _limit: perPage,
      _sort: sort,
      _order: order,
    },
    transformResponse: transformResponseWrapper((d: Pokemon[], h) => {
      const total = h ? parseInt(h['x-total-count'], 10) : 0
      return newResource(d, total, page, perPage)
    }),
  }, {
    data: pokemonResource,
    headers: {
      'x-total-count': pokemonResource.meta.total.toString(),
    },
  })

  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const getRedirect = () => {
    const redirect = getCookie('redirect')
    if (redirect) {
      deleteCookie('redirect')
      return redirect.toString()
    }

    return '/'
  }

  const login = async (e: SyntheticEvent) => {
    e.stopPropagation()
    e.preventDefault()

    setSubmitting(true)

    const res = await axios.post('api/mock/login')
    if (res.status === 200) {
      router.push(getRedirect())
    }
    setSubmitting(false)
  }


  return (
    <AdminLayout>
      <Card>
        <Card.Header>Mail Sender</Card.Header>
        <Card.Body>
          <form onSubmit={login}>
            <InputGroup className="mb-3">
              <InputGroup.Text>
                <FontAwesomeIcon
                  icon={faUser}
                  fixedWidth
                />
              </InputGroup.Text>
              <Form.Control
                name="username"
                required
                disabled={submitting}
                placeholder="Username"
                aria-label="Username"
                defaultValue="Username"
              />
            </InputGroup>

            <InputGroup className="mb-3">
              <InputGroup.Text>
                <FontAwesomeIcon
                  icon={faLock}
                  fixedWidth
                />
              </InputGroup.Text>
              <Form.Control
                type="password"
                name="password"
                required
                disabled={submitting}
                placeholder="Password"
                aria-label="Password"
                defaultValue="Password"
              />
            </InputGroup>
          </form>
          <Pagination meta={resource.meta} />
          <PokemonList pokemons={resource.data} />
          <Pagination meta={resource.meta} />
        </Card.Body>
      </Card>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const pokemonListURL = `${process.env.NEXT_PUBLIC_POKEMON_LIST_API_BASE_URL}pokemons` || ''
  let page = 1
  if (context.query?.page && typeof context.query.page === 'string') {
    page = parseInt(context.query.page, 10)
  }

  let perPage = 20
  if (context.query?.per_page && typeof context.query.per_page === 'string') {
    perPage = parseInt(context.query.per_page.toString(), 10)
  }

  let sort = 'id'
  if (context.query?.sort && typeof context.query.sort === 'string') {
    sort = context.query.sort
  }

  let order = 'asc'
  if (context.query?.order && typeof context.query.order === 'string') {
    order = context.query.order
  }

  const { data: pokemons, headers } = await axios.get<Pokemon[]>(pokemonListURL, {
    params: {
      _page: page,
      _limit: perPage,
      _sort: sort,
      _order: order,
    },
  })

  const total = parseInt(headers['x-total-count'], 10)
  const pokemonResource: Resource<Pokemon> = newResource(pokemons, total, page, perPage)

  return {
    props: {
      pokemonResource,
      page,
      perPage,
      sort,
      order,
    }, // will be passed to the page component as props
  }
}

export default Pokemons
