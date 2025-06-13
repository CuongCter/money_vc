import { Link } from "react-router-dom"
import Button from "../components/ui/Button"
import { useLanguageStore } from "../store/languageStore"

const NotFoundPage = () => {
  const { t } = useLanguageStore()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600">404</h1>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">{t("common.noData")}</h2>
        <p className="mt-2 text-base text-gray-500">{t("common.noData")}</p>
        <div className="mt-6">
          <Link to="/">
            <Button>{t("dashboard.overview")}</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
