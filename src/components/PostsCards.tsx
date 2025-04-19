interface Post {
  id: string
  comunidade_id: string
  titulo: string
  descricao: string
  tipo: string
  prazo?: string
  data_criacao: string
}

interface PostCardProps {
  post: Post
}

const PostCards = ({ post }: PostCardProps) => {
  return (
    <div className="bg-base-200 shadow rounded p-6 hover:shadow-lg transition duration-300">
      <h2 className="text-2xl font-semibold mb-2">{post.titulo}</h2>
      <p className="text-gray-700 mb-4">{post.descricao}</p>
      <div className="flex justify-between items-center">
        <small className="text-gray-500">
          {new Date(post.data_criacao).toLocaleDateString()}
        </small>
        {post.tipo && (
          <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
            {post.tipo}
          </span>
        )}
      </div>
      {post.prazo && (
        <div className="mt-2 text-sm text-gray-600">
          <span className="font-medium">Prazo: </span>
          {post.prazo}
        </div>
      )}
    </div>
  )
}

export default PostCards
