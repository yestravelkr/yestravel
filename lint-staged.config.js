module.exports = {
    // 각 워크스페이스별로 해당 디렉토리에서 lint 실행
    'apps/api/**/*.{ts,tsx,js,jsx}': [
        'cd apps/api && yarn lint -- --fix',
    ],
    'apps/backoffice/**/*.{ts,tsx,js,jsx}': [
        'cd apps/backoffice && yarn lint -- --fix',
    ],
    'apps/partner/**/*.{ts,tsx,js,jsx}': [
        'cd apps/partner && yarn lint -- --fix',
    ],
    'packages/**/*.{ts,tsx,js,jsx}': (filenames) => {
        // 변경된 파일이 속한 패키지만 lint 실행 (api-types, min-design-system, option-selector 제외)
        const EXCLUDED_PKGS = ['api-types', 'min-design-system', 'option-selector', 'admin-shared'];
        const packages = [...new Set(
            filenames.map(filename => {
                const match = filename.match(/packages\/([^\/]+)/);
                return match ? match[1] : null;
            }).filter(Boolean).filter(pkg => !EXCLUDED_PKGS.includes(pkg))
        )];

        return packages.map(pkg => `yarn workspace @yestravelkr/${pkg} run lint:fix`);
    }
};