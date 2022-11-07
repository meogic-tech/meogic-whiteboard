select sum(stats.additions) + sum(stats.deletions) from commits, stats('', commits.hash) where stats.file_path not like '%lock%'
